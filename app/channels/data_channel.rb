class DataChannel < ApplicationCable::Channel
  def subscribed
    stream_from "data_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
