import sqlite3
import socket
import json
import datetime
import sys
import os
import time
from threading import Thread
from queue import Queue
import urllib.request

q = Queue()
alive = True


def worker():
    conn = sqlite3.connect('../db/development.sqlite3')
    cur = conn.cursor()
    startTime = int(round(time.time() * 1000))
    while alive:
        item = q.get()
        cur.execute(item)
        if (int(round(time.time() * 1000)) - startTime >= 100):
            urllib.request.urlopen('http://127.0.0.1:3000/show')
            conn.commit()
            startTime = int(round(time.time() * 1000))

    conn.close()


UDP_IP = '0.0.0.0'            # Connect to any address
UDP_PORT = 8888               # Arbitrary non-privileged port
MAX_BUFFER = 1024             # maximum size (in bytes) of the message
DB_DELAY = 0.01               # Seconds between DB writes


def main():
  #Initialize DB connection
  print("Connecting to DB...")

  sqlTh = Thread(target=worker)
  sqlTh.daemon = True
  sqlTh.start()
  print("DB connected")

  #Initialize UDP listener
  print("Initializing network lisener...")
  sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  sock.bind((UDP_IP, UDP_PORT))
  print("listening on port " + str(UDP_PORT))
  while True:
    data, addr = sock.recvfrom(MAX_BUFFER)
    print("Recieved: " + str(data) + " From: " + str(addr))
    #parse the json
    print(str(data))
    data_dict = json.loads(str(data)[2:-1])
    sensor_reading = json.dumps(data_dict['data'], separators=(',',':'))
    #get the time
    timestring = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
    q.put("INSERT INTO data_packets (created_at, updated_at, sensor, t, data) VALUES('" + timestring + "','" + timestring + "','" + data_dict['id'] + "'," + str(data_dict['t']) + ",'" + sensor_reading + "')")

  alive = False
  sqlTh.join()
  print("Something bad happened (invalid data? Lost db connection?)")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        alive = False
        #sqlTh.join()
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)