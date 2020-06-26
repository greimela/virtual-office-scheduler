# virtual-office-scheduler
Scheduler for https://github.com/TNG/virtual-office

## Session scheduler
* Parse Google Drive Spreadsheet
* Convert data structure to export JSON
  * Generate random join groups
  * Split up rooms with multiple meeting ids
  * Generate room join links
  * Add a given date to the start time of the rooms
* Export to Virtual Office

Start via
```
npm run start:scheduleSessions
```

Required env variables:
* GOOGLE_SPREADSHEET_ID
* MEETINGS_SHEET_NAME
* SCHEDULE_SHEET_NAME
* VIRTUAL_OFFICE_BASE_URL
* VIRTUAL_OFFICE_USERNAME
* VIRTUAL_OFFICE_PASSWORD
* GOOGLE_SERVICE_ACCOUNT_MAIL
* GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
* ENABLE_ROOM_JOIN_MINUTES_BEFORE_START

## Meeting scheduler
Meeting scheduler for https://github.com/TNG/virtual-office

* Use a list of users to schedule zoom meetings

Start via
```
npm run start:start:createMeetings
```

Required env variables:
* MEETINGS_SHEET_NAME
* ZOOM_JWT
* USER_EMAIL_FILE
* MEETING_TOPIC
* MEETING_PASSWORD
* MEETING_START_TIME
* MEETING_DURATION
* GOOGLE_SERVICE_ACCOUNT_MAIL
* GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

Optional env variables:
* SCHEDULE_DATE
* SLACK_ENABLE_RATE_LIMITING
* SLACK_BASE_URL
* SLACK_TOKEN