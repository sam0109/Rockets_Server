class DataPacketsController < ApplicationController
  before_action :set_data_packet, only: [:show, :edit, :update, :destroy]

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

  # GET /data_packets/1/edit
  def edit
  end

  # POST /data_packets
  # POST /data_packets.json
  def create
    @data_packet = DataPacket.new(data_packet_params)

    respond_to do |format|
      if @data_packet.save
        format.html { redirect_to @data_packet, notice: 'Data packet was successfully created.' }
        format.json { render :show, status: :created, location: @data_packet }
      else
        format.html { render :new }
        format.json { render json: @data_packet.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /data_packets/1
  # PATCH/PUT /data_packets/1.json
  def update
    respond_to do |format|
      if @data_packet.update(data_packet_params)
        format.html { redirect_to @data_packet, notice: 'Data packet was successfully updated.' }
        format.json { render :show, status: :ok, location: @data_packet }
      else
        format.html { render :edit }
        format.json { render json: @data_packet.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /data_packets/1
  # DELETE /data_packets/1.json
  def destroy
    @data_packet.destroy
    respond_to do |format|
      format.html { redirect_to data_packets_url, notice: 'Data packet was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_data_packet
      @data_packet = DataPacket.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def data_packet_params
      params.require(:data_packet).permit(:Timestamp, :data)
    end
end
