import type { RoomMember } from "./RoomLobby";

type MemberGridProps = {
  members: RoomMember[];
};

export default function MemberGrid({ members }: MemberGridProps) {
  if (members.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Chưa có thành viên trong phòng.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm"
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt=""
              className={`h-16 w-16 rounded-full border-4 object-cover ${
                member.isReady ? "border-green-500" : "border-gray-300"
              }`}
            />
          ) : (
            <span
              aria-hidden="true"
              className={`flex h-16 w-16 items-center justify-center rounded-full border-4 bg-orange-100 text-xl font-semibold text-orange-700 ${
                member.isReady ? "border-green-500" : "border-gray-300"
              }`}
            >
              {member.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="mt-2 max-w-full truncate text-sm font-medium text-gray-800">
            {member.name}
          </span>
          <span
            className={`mt-1 text-xs font-medium ${
              member.isReady ? "text-green-700" : "text-gray-500"
            }`}
          >
            {member.isReady ? "Sẵn sàng" : "Đang chờ"}
          </span>
        </li>
      ))}
    </ul>
  );
}
