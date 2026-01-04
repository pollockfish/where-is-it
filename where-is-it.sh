#!/bin/bash
cd mail-server
API_PASSWORD=$API_PASSWORD SQL_PASSWORD=$SQL_PASSWORD node server.js &
cd ../where-is-it
ng serve