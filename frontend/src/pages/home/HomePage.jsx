import { useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");

	return (
		<>
			<div className='flex-[4_4_0] mr-auto  min-h-screen'>
				<div>
					<div
						
						onClick={() => setFeedType("forYou")}
					>
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10  h-1 rounded-full bg-primary'></div>
						)}
					</div>
				</div>


				<CreatePost />

				<Posts feedType={feedType} />
			</div>
		</>
	);
};
export default HomePage;