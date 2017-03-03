class DataPacketsController < ApplicationController

  # GET /data_packets
  # GET /data_packets.json
  def index
    #potentially useful to show all past data - removed because of lag
    #@data_packets = DataPacket.all
  end

  # ghetto way of triggering an update from the python server
  def show
    data_packets = DataPacket.where("created_at >= ?", Rails.application.config.most_recent_timestamp)
    puts data_packets
    ActionCable.server.broadcast 'data_channel', data: data_packets
    Rails.application.config.most_recent_timestamp = Time.current
  end
end
