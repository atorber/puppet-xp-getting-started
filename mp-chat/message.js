module.exports = {
    "nested": {
      "Message": {
        "oneofs": {
          "_name": {
            "oneof": [
              "name"
            ]
          },
          "_timeHms": {
            "oneof": [
              "timeHms"
            ]
          },
          "_properties": {
            "oneof": [
              "properties"
            ]
          },
          "_events": {
            "oneof": [
              "events"
            ]
          },
          "_params": {
            "oneof": [
              "params"
            ]
          }
        },
        "fields": {
          "reqId": {
            "type": "string",
            "id": 1
          },
          "method": {
            "type": "string",
            "id": 2
          },
          "version": {
            "type": "string",
            "id": 3
          },
          "timestamp": {
            "type": "string",
            "id": 4
          },
          "name": {
            "type": "string",
            "id": 5,
            "options": {
              "proto3_optional": true
            }
          },
          "timeHms": {
            "type": "string",
            "id": 6,
            "options": {
              "proto3_optional": true
            }
          },
          "properties": {
            "type": "string",
            "id": 7,
            "options": {
              "proto3_optional": true
            }
          },
          "events": {
            "type": "string",
            "id": 8,
            "options": {
              "proto3_optional": true
            }
          },
          "params": {
            "type": "string",
            "id": 9,
            "options": {
              "proto3_optional": true
            }
          }
        }
      }
    }
  }