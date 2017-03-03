class DataPacketsController < ApplicationController

  # GET /data_packets
  # GET /data_packets.json
  def index
    #potentially useful to show all past data - removed because of lag
    #@data_packets = DataPacket.all
  end

  # ghetto way of triggering an update from the python server
  def show
    @data_packets = DataPacket.where("created_at >= ?", Time.zone.now.beginning_of_day)
    ActionCable.server.broadcast 'data_channel', Altitude: @data_packet.Altitude, Timestamp: @data_packet.Timestamp
  end
end
