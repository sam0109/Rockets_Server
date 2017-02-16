json.extract! data_packet, :id, :Timestamp, :Altitude, :created_at, :updated_at
json.url data_packet_url(data_packet, format: :json)