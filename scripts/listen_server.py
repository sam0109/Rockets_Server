#!/usr/bin/python

import sqlite3
import socket
import json
import datetime
import sys
import os
import time
import threading
from Queue import Queue

q = Queue()
class sqlThread(threading.Thread):

    def __init__(self, conn, cur):
        threading.Thread.__init__(self)
        self.conn = conn
        self.cur = cur

    def run(self):
        while True:
            item = q.get()
            self.cur.execute(item)
            self.conn.commit()


UDP_IP = '0.0.0.0'            # Connect to any address
UDP_PORT = 8888               # Arbitrary non-privileged port
MAX_BUFFER = 1024             # maximum size (in bytes) of the message
DB_DELAY = 0.01               # Seconds between DB writes

def main():
  #Initialize DB connection
  print("Connecting to DB...")
  conn = sqlite3.connect('../db/development.sqlite3')
  c = conn.cursor()
  sqlTh = sqlThread(conn, c)
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
    time1 = time.time()
    #parse the json
    data_dict = json.loads(data)
    sensor_reading = json.dumps(data_dict['data'], separators=(',',':'))
    #get the time
    timestring = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')
    #insert the data into the DB and save it
    #c.execute("INSERT INTO data_packets (created_at, updated_at, sensor, t, data) VALUES('" + timestring + "','" + timestring + "','" + data_dict['id'] + "'," + str(data_dict['t']) + ",'" + sensor_reading + "')")
    #conn.commit()
    q.put("INSERT INTO data_packets (created_at, updated_at, sensor, t, data) VALUES('" + timestring + "','" + timestring + "','" + data_dict['id'] + "'," + str(data_dict['t']) + ",'" + sensor_reading + "')")
    time2 = time.time()
    print('insertion took %0.3f ms' % ((time2-time1)*1000.0))

  print("Something bad happened (invalid data? Lost db connection?)")
  conn.close()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print 'Interrupted'
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)