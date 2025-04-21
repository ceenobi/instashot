// import ActionButton from "@/components/ActionButton";
// import MetaArgs from "@/components/MetaArgs";
// import Modal from "@/components/Modal";
// import { User } from "@/types";
// import { useEffect, useState } from "react";
// import {
//   useFetcher,
//   useLoaderData,
//   useLocation,
//   useNavigate,
//   useOutletContext,
//   useParams,
// } from "react-router";
// import { toast } from "sonner";

// export function Component() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [active, setActive] = useState(0);
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const fetcher = useFetcher();
//   const { data } = useLoaderData() as {
//     data: {
//       users: {
//         id: string;
//         username: string;
//         profilePicture: string;
//       }[];
//     };
//   };
//   const { user } = useOutletContext() as { user: User };
//   //   const [isFollowing, setIsFollowing] = useOptimistic(
//   //     user.following?.some((itemId) =>
//   //       data?.users?.map((item) => item.id).includes(itemId)
//   //     ) ?? false
//   //   );
//   const path = location.pathname === `/post/see-who-liked/${id}`;

//   useEffect(() => {
//     if (path) {
//       setIsOpen(true);
//     } else {
//       setIsOpen(false);
//     }
//   }, [path]);

//   useEffect(() => {
//     if (fetcher.data) {
//       //   setIsFollowing((prev) => !prev);
//       if (fetcher.data.success) {
//         // setIsFollowing(true);
//         toast.success(fetcher.data.message, { id: "follow-user" });
//       } else {
//         toast.error(fetcher.data.message || fetcher.data.error, {
//           id: "follow-userError",
//         });
//       }
//     }
//   }, [fetcher.data]);

//   const handleClose = () => {
//     setIsOpen(false);
//     navigate("/");
//   };

//   console.log(data);

//   return (
//     <>
//       <MetaArgs title="View post likes" description="View post likes" />
//       <Modal
//         isOpen={isOpen}
//         id="seeWhoLikedModal"
//         title="Likes"
//         classname="w-[90%] max-w-[400px] mx-auto py-3 px-0"
//         onClose={() => setIsOpen(false)}
//       >
//         <div>
//           {data.users.map((item, index) => (
//             <div
//               key={item.id}
//               className="flex justify-between items-center text-center p-3"
//             >
//               <div className="flex items-center">
//                 <div className=" avatar avatar-placeholder">
//                   <div className="w-9 rounded-full border border-gray-300">
//                     {item.profilePicture ? (
//                       <img
//                         src={item.profilePicture}
//                         alt={item.username}
//                         loading="lazy"
//                       />
//                     ) : (
//                       <span className="text-3xl">
//                         {item.username?.charAt(0)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <p className="ml-2 font-semibold">{item.username}</p>
//               </div>
//               <fetcher.Form method="patch" action={`/post/see-who-liked/${id}`}>
//                 <ActionButton
//                   type="submit"
//                   loading={fetcher.state === "submitting"}
//                   disabled={user.id === item.id}
//                   text={
//                     active === index && fetcher.state === "submitting"
//                       ? "Updating..."
//                       : user.following?.includes(item.id)
//                       ? "Unfollow"
//                       : "Follow"
//                   }
//                   classname="btn btn-sm btn-primary w-[120px]"
//                   onClick={() => {
//                     setActive(index);
//                     fetcher.submit(
//                       {
//                         id: item.id,
//                       },
//                       { method: "patch", action: `/post/see-who-liked/${id}` }
//                     );
//                   }}
//                 />
//               </fetcher.Form>
//             </div>
//           ))}
//         </div>
//         <button
//           className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
//           type="button"
//           onClick={handleClose}
//         >
//           ✕
//         </button>
//       </Modal>
//     </>
//   );
// }

// Component.displayName = "SeeWhoLiked";
