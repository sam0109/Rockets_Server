class CreateDataPackets < ActiveRecord::Migration[5.0]
  def change
    create_table :data_packets do |t|
      t.string :Timestamp
      t.string :Altitude

      t.timestamps
    end
  end
end
