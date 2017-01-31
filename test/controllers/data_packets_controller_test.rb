require 'test_helper'

class DataPacketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @data_packet = data_packets(:one)
  end

  test "should get index" do
    get data_packets_url
    assert_response :success
  end

  test "should get new" do
    get new_data_packet_url
    assert_response :success
  end

  test "should create data_packet" do
    assert_difference('DataPacket.count') do
      post data_packets_url, params: { data_packet: { Timestamp: @data_packet.Timestamp, data: @data_packet.data } }
    end

    assert_redirected_to data_packet_url(DataPacket.last)
  end

  test "should show data_packet" do
    get data_packet_url(@data_packet)
    assert_response :success
  end

  test "should get edit" do
    get edit_data_packet_url(@data_packet)
    assert_response :success
  end

  test "should update data_packet" do
    patch data_packet_url(@data_packet), params: { data_packet: { Timestamp: @data_packet.Timestamp, data: @data_packet.data } }
    assert_redirected_to data_packet_url(@data_packet)
  end

  test "should destroy data_packet" do
    assert_difference('DataPacket.count', -1) do
      delete data_packet_url(@data_packet)
    end

    assert_redirected_to data_packets_url
  end
end
