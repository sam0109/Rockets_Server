class RemoveAltitudeFromDataPackets < ActiveRecord::Migration[5.0]
  def change
    remove_column :data_packets, :Altitude, :string
  end
end
