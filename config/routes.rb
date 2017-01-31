Rails.application.routes.draw do
  resources :data_packets, :path => '/'
  root 'data_packets#index'
end
