class User < ApplicationRecord
 has_many :scores, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates :username,
            presence: true,
            uniqueness: { case_sensitive: false }
end
