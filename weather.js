var gp = require('weather-gov-graph-parse');
var request = require('request');
var Slack = require('slack-node');
var schedule = require('node-schedule');

const MEETING_DAYS = [2, 5];
const UPDATE_AT_HOUR = 18;

var slack = new Slack();
slack.setWebhook('https://hooks.slack.com/services/.../.../...');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = MEETING_DAYS.map(function(m) { return ((m - 1) > 0) ? m - 1 : 6 });
rule.hour = UPDATE_AT_HOUR;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function() {
    gp('44.0646', '-123.0761', function(err, data) {
        if (err) {
            console.log(err);
        } else {
            var high = 0;
            data.forEach(function(forecast) {
                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                if (forecast.date.getDate() === tomorrow.getDate()) {
                    if (forecast.temperature > high) {
                        high = forecast.temperature;
                    }
                }
            });

            notifySlack(high);
        }
    });
});

function notifySlack(temp) {
    var message = '';

    if (temp >= 85) {
        message = 'You may wear shorts tomorrow, and power tools will not be used.';
    } else {
        message = 'Long pants are required for work in the Foundry.';
    }

    slack.webhook({
        channel: '#weather',
        username: 'Weather Bot',
        icon_emoji: ':rain_cloud:',
        text: 'High Tomorrow: ' + temp + '\n' + message + '\n\n' + '_(if there are any issues with this bot, please contact @andrew)_'
    }, function(err, response) {
        if (err) {
            console.log(err)
        }
    });
}
