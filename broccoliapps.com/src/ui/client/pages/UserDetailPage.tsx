import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { getUser } from "../../../shared/api-contracts";

export type UserDetailProps = {
  id?: string;
  name?: string;
  email?: string;
};

export const UserDetailPage = ({ id, name: initialName, email: initialEmail }: UserDetailProps) => {
  const [user, setUser] = useState({ name: initialName, email: initialEmail });
  const [loading, setLoading] = useState(!initialName);

  useEffect(() => {
    if (!initialName && id) {
      getUser.invoke({ id }).then((data) => {
        setUser({ name: data.name, email: data.email });
        setLoading(false);
      });
    }
  }, [id, initialName]);

  const handleBackClick = (e: Event) => {
    e.preventDefault();
    route("/users");
  };

  if (loading) {
    return (
      <div class="user-detail">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div class="user-detail">
      <h1>{user.name}</h1>
      <p>ID: {id}</p>
      <p>Email: {user.email}</p>
      <a href="/users" onClick={handleBackClick}>
        Back to Users
      </a>
    </div>
  );
};
