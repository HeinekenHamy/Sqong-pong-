class ScoresController < ApplicationController
  before_action :authenticate_user!

  def index
    # will list leaderboard
    @scores = Score.includes(:user).order(value: :desc).limit(3)
  end

  def create
    # called when a game ends
    @score = current_user.scores.build(value: params[:value])

    if @score.save
      head :created
    else
      render json: { errors: @score.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
