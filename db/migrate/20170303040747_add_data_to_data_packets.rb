class AddDataToDataPackets < ActiveRecord::Migration[5.0]
  def change
    add_column :data_packets, :data, :string
  end
end
