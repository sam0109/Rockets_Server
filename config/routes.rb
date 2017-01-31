Rails.application.routes.draw do
  resources :data_packets
  root 'application#hello'
end
