class RemoveTimestampFromDataPackets < ActiveRecord::Migration[5.0]
  def change
    remove_column :data_packets, :Timestamp, :string
  end
end
