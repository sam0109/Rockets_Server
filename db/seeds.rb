# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

#{"data":"WICED2", "t":1488516273228, "data":"{"ADC1":0342}"}

DataPacket.create( sensor: "WICED2", t: '1488516273228', data: '{"ADC1":"0342"}' )