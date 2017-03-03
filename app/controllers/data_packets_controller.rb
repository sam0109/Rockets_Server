class DataPacketsController < ApplicationController

  # GET /data_packets
  # GET /data_packets.json
  def index
    @data_packets = DataPacket.all
  end
end
