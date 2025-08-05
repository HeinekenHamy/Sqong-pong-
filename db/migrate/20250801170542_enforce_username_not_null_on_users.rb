class EnforceUsernameNotNullOnUsers < ActiveRecord::Migration[8.0]
  def up
    User.where(username: nil).find_each do |u|
      u.update!(username: u.email.split("@").first)
    end

    change_column_null :users, :username, false

    add_index :users, :username, unique: true unless index_exists?(:users, :username)
  end

  def down
    change_column_null :users, :username, true
    remove_index :users, :username if index_exists?(:users, :username)
  end
end
