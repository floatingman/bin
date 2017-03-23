#!/usr/bin/expect

set host [lindex $argv 0];
spawn ssh qatp@$host.qa.digitalreasoning.com
expect "password"
send "$env(GRATER_PASSWORD)\r"
interact
