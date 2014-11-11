#!/usr/bin/env bash

# Any subsequent commands which fail will cause the shell script to exit immediately
set -e

# folder path for current script file
DIR=`dirname $0`
cd $DIR

# Get absolute path of current working folder
PWD=`pwd -P`

function usage_help()
{
  echo "Usage run.sh <command> "
  echo
  echo "where command is one of:"
  echo "email-service, content-service, session-service"
  echo
  echo "Examples:"
  echo "  ./run.sh email-service"
  echo "  PORT=3003 ./run.sh content-service"
}

function runEmailService()
{
  nar run $DIR/netis-email-service-1.0.0.nar --args-start "--config $PWD/NetIS.Service.Email_dev.yml"
}

function runContentService()
{
  nar run $DIR/netis-content-service-0.1.0.nar --args-start "--config $PWD/NetIS.Service.Content_dev.yml"
}

function runSessionService()
{
  nar run $DIR/netis-session-service-1.0.0.nar --args-start "--config $PWD/NetIS.Service.Session_dev.yml"
}

# Usage: pack.sh <command>
#   $1 as <command>
case $1 in
  email-service ) runEmailService ;;
  content-service ) runContentService ;;
  session-service ) runSessionService ;;
  * ) usage_help ;;
esac
