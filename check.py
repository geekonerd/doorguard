import time
import RPi.GPIO as GPIO

from socketIO_client import SocketIO
socketIO = SocketIO('https://localhost:8080', verify=False)

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_UP)

door_name = "porta ingresso"

try:
    old_value = 0
    while True:
        v = GPIO.input(17)
	if (v and old_value == 0) or (not v and old_value == 1) :
    	    t = int(time.time())
            print '{0} - value: {1}'.format(t, v)
            socketIO.emit('insert', {'time': t, 'door': door_name, 'value': v})
            old_value = v
        time.sleep(1)

except KeyboardInterrupt:
    GPIO.cleanup()
