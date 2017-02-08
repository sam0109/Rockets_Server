Rails.application.routes.draw do
  get  '/rocket_commands',   to: 'rocket_commands#index'
  resources :data_packets, :path => '/'
  root 'data_packets#index'
  get 'data_packets/data', :defaults => { :format => 'json' }
end
