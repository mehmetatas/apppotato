import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";

type User = {
  id: number;
  name: string;
};

export type UsersListProps = {
  users?: User[];
};

export const UsersListPage = ({ users: initialUsers }: UsersListProps) => {
  const [users, setUsers] = useState<User[] | undefined>(initialUsers);
  const [loading, setLoading] = useState(!initialUsers);

  useEffect(() => {
    if (!initialUsers) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data.users);
          setLoading(false);
        });
    }
  }, [initialUsers]);

  const handleUserClick = (e: Event, userId: number) => {
    e.preventDefault();
    route(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div class="users-page">
        <h1>Users</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div class="users-page">
      <h1>Users</h1>
      <ul class="users-list">
        {users?.map((user) => (
          <li key={user.id}>
            <a href={`/users/${user.id}`} onClick={(e) => handleUserClick(e, user.id)}>
              {user.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
