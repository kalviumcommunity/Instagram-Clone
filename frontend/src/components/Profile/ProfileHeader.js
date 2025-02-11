import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import ClipLoader from "react-spinners/ClipLoader";

const ProfileHeader = ({ username, postCount, user, updateNewPost }) => {
    console.log(user);
    const currentUserId = parseInt(localStorage.getItem("id"))
    const [isFollowing, setIsFollowing] = useState(user.followers.some(follower => follower.id === currentUserId))
    const API_URL = window.location.origin.replace("3000", "5000");
    const [showProfilePicModal, setShowProfilePicModal] = useState(false)
    const openProfilePicModal = () => {
        if (user.id === currentUserId) { setShowProfilePicModal(true) }
    }
    const closeProfilePicModal = () => {
        setShowProfilePicModal(false)
    }
    const [loading, setLoading] = useState(false)

    const handleUnFollow = async () => {
        try {
            const response = await fetch(`/api/users/unfollow/${user.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            const data = await response.json()
            console.log(data);
            setIsFollowing(false)
            updateNewPost()

        } catch (err) {
            console.log(err)
        }

    }

    const handleFollow = async () => {
        try {
            const response = await fetch(`/api/users/follow/${user.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            const data = await response.json()
            console.log(data);
            setIsFollowing(true)
            updateNewPost()

        } catch (err) {
            console.log(err)
        }

    }

    const handleUploadPic = async (event) => {
        const image = event.target.files[0]
        if (image) {
            setLoading(true)
            const fileName = `${Date.now()}-${image.name}`
            const { data, error } = await supabase
                .storage
                .from('images')
                .upload(fileName, image)
            console.log("Uploaded data : ", data);

            const urlInfo = supabase
                .storage
                .from('images')
                .getPublicUrl(data.path);

            uploadProfilePhotoInDatabase(urlInfo.data.publicUrl)

            console.log("File Link Retirieved Successfull : ", urlInfo.data.publicUrl)
        }
    }

    const uploadProfilePhotoInDatabase = async (photoUrl) => {

        try {
            const response = await fetch(`/api/users/profile/photo`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profilePhoto: photoUrl
                })
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const data = await response.json()
            console.log(data);
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            setShowProfilePicModal(false)

        }
    }

    const removeProfilePhotoInDatabase = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/users/profile/photo`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                },
            })
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            const data = await response.json()
            console.log(data);
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
            setShowProfilePicModal(false)
        }
    }


    return (
        <div className="flex items-center p-4">
            <img onClick={openProfilePicModal} src="https://via.placeholder.com/150" alt="" className="w-24 h-24 rounded-full" />
            <div className="ml-6">
                <div className="text-2xl font-semibold">{username}</div>
                <div className="flex flex-wrap mt-2">
                    <span className="mr-4"> <strong>{postCount}</strong> posts</span>
                    <span className="mr-4"> <strong>{user.followers.length}</strong> followers</span>
                    <span className="mr-4"> <strong>{user.following.length}</strong> following</span>
                    {user.id !== currentUserId && (
                        <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={isFollowing ? handleUnFollow : handleFollow}>{isFollowing ? "Unfollow" : "Follow"}</button>
                    )
                    }
                </div>

            </div>
            {showProfilePicModal && (<div

                className="flex items-center justify-center h-full fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"

            >
                <div className="bg-white rounded-lg p-4 md:p-6 lg:p-8 w-full max-w-md mx-4 relative">
                    <button onClick={closeProfilePicModal} className="absolute top-0 right-2 text-gray-500 hover:text-gray-700 text-4xl">&times;</button>
                    <button className="block w-full mb-2 px-4 py-2 bg-green-500 text-white rounded">
                        <label htmlFor="upload-profile-pic" className="cursor-pointer">Upload New Photo</label>
                        <input type="file" id="upload-profile-pic" className="hidden" onChange={handleUploadPic} />
                    </button>
                    <button onClick={removeProfilePhotoInDatabase} className="block w-full mb-2 px-4 py-2 bg-red-500 text-white rounded">
                        Remove Current Photo

                    </button>
                    <button onClick={closeProfilePicModal} className="block w-full mb-2 px-4 py-2 bg-gray-500 text-white rounded">
                        Cancel
                    </button>

                </div>


            </div>)

            }

            {loading && (
                <ClipLoader
                    color={"#3B82F6"}
                    loading={loading}
                    size={50}
                    data-testid="loader"
                />
            )

            }
        </div>
    )
}

export default ProfileHeader