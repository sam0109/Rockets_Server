class AddTToDataPackets < ActiveRecord::Migration[5.0]
  def change
    add_column :data_packets, :t, :decimal
  end
end
