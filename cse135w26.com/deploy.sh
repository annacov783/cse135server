#!/bin/bash
set -e

BARE_REPO=/var/cse135-w26/cse135-w26.git
WORK_TREE=/var/www/cse135w26.com/public_html
BRANCH=main

export GIT_WORK_TREE=$WORK_TREE
export GIT_DIR=$BARE_REPO

git checkout -f $BRANCH
