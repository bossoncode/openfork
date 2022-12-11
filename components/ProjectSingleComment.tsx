import { Avatar, Box, Flex, Icon, Text } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from "react";
import { GoVerified } from "react-icons/go";
import { supabase } from "../utils/supabaseClient";
import ProjectCommentInput from "./ProjectCommentInput";

interface UserProps {
  avatar_url: string;
  display_name: string;
  username: string;
  is_verified: boolean;
}

const ProjectSingleComment = ({ comment }: any) => {
  const [user, setUser] = useState<UserProps>({
    avatar_url: "",
    display_name: "",
    username: "",
    is_verified: false,
  });

  const fetchUser = async () => {
    let { data: profiles, error }: any = await supabase
      .from("profiles")
      .select("username, is_verified, avatar_url, display_name")
      .eq("id", comment.user_id);
    setUser(profiles[0]);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Box mb={10}>
      <Flex mb={2} align={"center"}>
        <Avatar
          src={user.avatar_url}
          size={"sm"}
          mr={2}
          name={user.display_name}
        />
        <Text fontWeight={"bold"} mr={1}>
          {user.display_name}
        </Text>
        <Text fontSize={"sm"}>@{user.username}</Text>
        <Text fontSize="sm">
          {user.is_verified && <Icon as={GoVerified} ml={1} />}
        </Text>
      </Flex>
      <Text>{comment.comment_text}</Text>
      <Flex gap={7} my={2} fontSize={"xs"}>
        <Text cursor={"pointer"}>Upvote(0)</Text>
        {/* <Text>Reply</Text> */}
        <Text>
          {new Date(comment.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            // dayPeriod: "ordinal",
          })}
        </Text>
      </Flex>
      <Box ml={10}></Box>
    </Box>
  );
};

export default ProjectSingleComment;