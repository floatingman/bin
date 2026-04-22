#!/bin/bash -e

touchpadString="SYNA8008:00 06CB:CE58 Touchpad"
# touchpadString="VMware VMware Virtual USB Mouse"
touchpadID=$(xinput list | grep "$touchpadString" | awk -F " " '{print $6}' | awk -F "=" '{print $2}')
trackpointString="TPPS/2 Elan TrackPoint"
trackpointID=$(xinput list | grep "$trackpointString" | awk -F " " '{print $6}' | awk -F "=" '{print $2}')

# Uncomment to disable this script
# exit 0

# TOUCHPAD SECTION
# see man synaptics(4) for touchpad

# Enable Touchpad
# boolean
xinput set-prop "$touchpadID" "Device Enabled" 1

# Touchpad finger
# 32 bit, 3 values, low, high, press
# Low - When  finger  pressure  drops  below  this value, the driver
#      counts it as a release. Property: "Synaptics Finger"
# High - When finger pressure  goes  above  this  value,  the  driver
#              counts it as a touch. Property: "Synaptics Finger"
xinput set-prop "$touchpadID" "Synaptics Finger" 30 33 128

# Tap Move
# Synaptics Tap Move (292)
# Maximum movement of the finger for detecting a tap
xinput set-prop "$touchpadID" "Synaptics Tap Move" 122

# Increase two-finger pressure (less sensitivity)
xinput set-prop "$touchpadID" "Synaptics Two-Finger Pressure" 350

# Two-finger width
# Synaptics Two-Finger Width (297)
# For  touchpads not capable of detecting multiple fingers but are capable
#  of detecting finger  width  and  pressure
# Width threshhold
# Works best with PalmDetect off
xinput set-prop "$touchpadID" "Synaptics Two-Finger Width" 8

# Scrolling speed
# Synaptics Scrolling Distance (298)
# Vertical/horiz move  distance of finger for scroll event
xinput set-prop "$touchpadID" "Synaptics Scrolling Distance" -60 -60

# Mouse Click Emulation
# Synaptics Tap Action (305)
xinput set-prop "$touchpadID" "Synaptics Tap Action" 0 0 0 0 1 3 2

# Circular Scrolling
# Synaptics Circular Scrolling (307)
# boolean
xinput set-prop "$touchpadID" "Synaptics Circular Scrolling" 0

# Circular scrolling distance (speed?)
# Synaptics Circular Scrolling Distance (308)
# Move  angle  (radians) of finger to generate a scroll event
xinput set-prop "$touchpadID" "Synaptics Circular Scrolling Distance" 0.100007

# Palm rejection
# Synaptics Palm Detection (311)
# See Two-finger width below
# If palm detection should be enabled
# boolean
xinput set-prop "$touchpadID" "Synaptics Palm Detection" 1

# Touchpad palm rejection
# PalmMinWidth - Minimum finger width at which touch is  considered  a  palm
# PalmMinZ - Minimum finger pressure at which touch is considered a palm
# width, min z
xinput set-prop "$touchpadID" "Synaptics Palm Dimensions" 2 25

# Minimum pressure motion
# Synaptics Pressure Motion (314)
# Finger pressure at which min/max pressure motion factor is applied
# min, max
xinput set-prop "$touchpadID" "Synaptics Pressure Motion" 55 160

# Tap-and-Drag
# Synaptics Gestures (317)
# TapAndDragGesture
# boolean
xinput set-prop "$touchpadID" "Synaptics Gestures" 1

# TRACKPOINT SECTION
# see man libinput(4) for Trackpoint

# Enabled Trackpoint
xinput set-prop "trackpointID" "Device Enabled" 1

# Trackpoint middle-button disable scrolling
xinput set-prop "$trackpointID" "libinput Scroll Method Enabled" 0 0 1

# Acceleration
# libinput Accel Speed (336)
# float, range -1 - 1
xinput set-prop "$trackpointID" "libinput Accel Speed" -0.250000

# Acceleration profile
# libinput Accel Profile Enabled (339)
# flat, adaptive
xinput set-prop "$trackpointID" "libinput Accel Profile Enabled" 1 0
