class AddSensorToDataPackets < ActiveRecord::Migration[5.0]
  def change
    add_column :data_packets, :sensor, :string
  end
end
