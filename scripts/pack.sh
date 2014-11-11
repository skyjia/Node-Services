#!/usr/bin/env bash

# Any subsequent commands which fail will cause the shell script to exit immediately
set -e

# folder path for current script file
DIR=`dirname $0`
SRC_DIR=$DIR/..
DIST_DIR=$DIR/../dist

function usage_help()
{
  echo "Usage pack.sh <command> "
  echo
  echo "where command is one of:"
  echo "create, clean, npm-install, npm-update"
}

function createAllNodePackages()
{
  # check dist folder existing
  if [ ! -d "$DIRECTORY" ]; then
    mkdir -p $DIST_DIR
  fi

  clearDist

  echo "Creating node packages..."

  nar create $SRC_DIR/NetIS.Service.Email -o $DIST_DIR
  nar create $SRC_DIR/NetIS.Service.Content -o $DIST_DIR
  nar create $SRC_DIR/NetIS.Service.Session -o $DIST_DIR

  copyConfigurationFiles

  echo "Finish to create node packages..."
}

function npmInstallAll()
{
  echo "Installing npm packages..."

  pushd $SRC_DIR/NetIS.Service.Email && npm install && popd
  pushd $SRC_DIR/NetIS.Service.Content && npm install && popd
  pushd $SRC_DIR/NetIS.Service.Session && npm install && popd

  echo "Finish to install npm packages..."
}

function npmUpdateAll()
{
  echo "Updating npm packages..."

  pushd $SRC_DIR/NetIS.Service.Email && npm update && popd
  pushd $SRC_DIR/NetIS.Service.Content && npm update && popd
  pushd $SRC_DIR/NetIS.Service.Session && npm update && popd

  echo "Finish to update npm packages..."
}

function clearDist()
{
  echo "Clearing dist..."

  # remove all .nar files.
  rm -f $DIST_DIR/*.nar

  # remove all .yml files
  rm -f $DIST_DIR/*.yml

  echo "Cleared."
}

function copyConfigurationFiles()
{
  echo "Copying configuration files."

  cp $SRC_DIR/NetIS.Service.Email/conf/development.yml $DIST_DIR/NetIS.Service.Email_dev.yml
  cp $SRC_DIR/NetIS.Service.Content/conf/development.yml $DIST_DIR/NetIS.Service.Content_dev.yml
  cp $SRC_DIR/NetIS.Service.Session/conf/development.yml $DIST_DIR/NetIS.Service.Session_dev.yml
}

# Usage: pack.sh <command>
#   $1 as <command>
case $1 in
  create ) createAllNodePackages ;;
  npm-install ) npmInstallAll ;;
  npm-update ) npmUpdateAll ;;
  clean ) clearDist ;;
  * ) usage_help ;;
esac
