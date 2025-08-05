class CreateScores < ActiveRecord::Migration[8.0]
  def change
    create_table :scores do |t|
      t.integer :value
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
