class DataPacketsController < ApplicationController
  before_action :set_data_packet, only: [:show]

  # GET /data_packets
  # GET /data_packets.json
  def index
    @data_packets = DataPacket.all
  end

  # GET /data_packets/1
  # GET /data_packets/1.json
  def show
  end

  # GET /data_packets/new
  def new
    @data_packet = DataPacket.new
  end

  # POST /data_packets
  # POST /data_packets.json
  def create
    @data_packet = DataPacket.new(data_packet_params)

    respond_to do |format|
      if @data_packet.save
        format.html { redirect_to @data_packet, notice: 'Data packet was successfully created.' }
        format.json { render :show, status: :created, location: @data_packet }
        ActionCable.server.broadcast 'data_channel', Altitude: @data_packet.Altitude, Timestamp: @data_packet.Timestamp
      else
        format.html { render :new }
        format.json { render json: @data_packet.errors, status: :unprocessable_entity }
      end
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_data_packet
      @data_packet = DataPacket.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def data_packet_params
      params.require(:data_packet).permit(:Timestamp, :Altitude)
    end
end
