class DataPacketsController < ApplicationController

  # GET /data_packets
  # GET /data_packets.json
  def index
    #potentially useful to show all past data - removed because of lag
    #@data_packets = DataPacket.all
  end

  # ghetto way of triggering an update from the python server
  def show
    data_packets = DataPacket.where("created_at > ?", Rails.application.config.most_recent_timestamp).order('created_at ASC')
    data_packets.each do |packet|
      ActionCable.server.broadcast 'data_channel', { id: packet.sensor, t: packet.t, data: packet.data }
      Rails.application.config.most_recent_timestamp = packet.created_at
    end

  end
end
