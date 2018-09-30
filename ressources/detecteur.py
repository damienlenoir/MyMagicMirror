#!/usr/bin/env python

import sys
import time
import RPi.GPIO as io
import subprocess

io.setmode(io.BCM)
SHUTOFF_DELAY = 120 # in seconds, how long the monitor will be on until next button press or PIR detection
PIR_PIN = 23     # 15 on the board (this needn't to be a PIR. Can be a button also)
LED_PIN = 16      # optional, don't use as Relay-PIN. It just shows detection time of the PIR without delay time

def main():
    io.setup(PIR_PIN, io.IN)
    io.setup(LED_PIN, io.OUT)
    turned_off = False
    last_motion_time = time.time()

    while True:
        if io.input(PIR_PIN):
            last_motion_time = time.time()
            io.output(LED_PIN, io.LOW)
            print ".",
            sys.stdout.flush()
            if turned_off:
                turned_off = False
                turn_on()
        else:
            if not turned_off and time.time() > (last_motion_time + 
                                                 SHUTOFF_DELAY):
                turned_off = True
                turn_off()
            if not turned_off and time.time() > (last_motion_time + 1):
                io.output(LED_PIN, io.HIGH)
        time.sleep(.1)

def turn_on():
	subprocess.call("sh /home/pi/monitor_on.sh", shell=True)

def turn_off():
	subprocess.call("sh /home/pi/monitor_off.sh", shell=True)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        io.cleanup()

