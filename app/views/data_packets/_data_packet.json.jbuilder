json.extract! data_packet, :id, :Timestamp, :data, :created_at, :updated_at
json.url data_packet_url(data_packet, format: :json)