Rails.application.routes.draw do
  get "games/show"

  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users

  root to: "home#index"

  get "/game", to: "games#show", as: :game

  resources :scores, only: [ :index, :create ]
end
