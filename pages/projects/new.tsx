import {
  Box,
  Button,
  Center,
  CloseButton,
  Flex,
  Icon,
  Input,
  ListItem,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  TagCloseButton,
  TagLeftIcon,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { FaCheck } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import Header from "../../components/Header";
import userInfo from "../../utils/userInfo";
import ts from "../../utils/techstack";
import { octokit } from "../../utils/octokitClient";
import { supabase } from "../../utils/supabaseClient";
import Head from "next/head";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import Router from "next/router";
interface RepoData {
  name: string;
  svn_url: string;
  full_name: string;
}

interface TagData {
  name: string;
  logo: any;
}

const Check = ({ done = false }) => {
  return (
    <Flex
      w="50px"
      h="50px"
      borderRadius="50px"
      align="center"
      justify="center"
      bg={done ? "gray.400" : "green.500"}
    >
      <FaCheck />
    </Flex>
  );
};

const AddNewProject = () => {
  const regex =
    /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;

  const testUrl = (url: string) => {
    return regex.test(url);
  };

  const [tabIndex, setTabIndex] = useState(0);
  const [repos, setRepos] = useState([]);
  const [username, setUsername] = useState("");
  const [query, setQuery] = useState("");
  const [projectName, setProjectName] = useState("");
  const [githubURL, setGithubURL] = useState("");
  const [websiteURL, setWebsiteURL] = useState("");
  const [description, setDescription] = useState("");
  const [repoFullname, setRepoFullname] = useState("");
  const [validurl, setValidURL] = useState(false);
  const [stackQuery, setStackQuery] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagData[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const stackQueryRef: any = useRef();
  const { width, height } = useWindowSize();
  const toast = useToast();

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  useEffect(() => {
    async function getRepos() {
      const user = (await supabase.auth.getUser()).data.user;
      setUsername(user?.user_metadata?.user_name);
      octokit
        .request("GET /users/{username}/repos", {
          username: user?.user_metadata?.user_name,
          per_page: 100,
        })
        .then((data: any) => {
          setRepos(data.data);
        });
    }
    getRepos();
  }, []);

  const publishProject = async () => {
    setPublishing(true);
    const project = {
      user: (await supabase.auth.getUser()).data.user?.id,
      name: projectName,
      description,
      github_url: githubURL,
      website_url: websiteURL,
      tech_stack: techStack,
      slug: projectName.toLowerCase().replaceAll(" ", "-"),
    };

    const { data, error } = await supabase.from("projects").insert(project);
    setPublishing(false);
    if (error) {
      console.log(error);
    } else {
      toast({
        title: "Your project has been publish",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        Router.push("/");
      }, 2500);
      handleTabsChange(0);
      setDescription("");
      setGithubURL("");
      setProjectName("");
      setSelectedTags([]);
      setWebsiteURL("");
    }
  };

  return (
    <>
      <Head>
        <title>Publish a new project - Openfork</title>
      </Head>
      <Header />
      <Flex
        align={"flex-start"}
        m={"auto"}
        className="new-project-wrapper"
        p="0 7%"
        justify={"space-between"}
        gap={3}
        mt={5}
      >
        {/* <Button
          onClick={() => {
            setShowConfetti(!showConfetti);
          }}
        >
          SHOW
        </Button> */}
        {showConfetti && <Confetti width={width} height={height} />}
        <Flex direction={"column"}>
          <Text fontSize={"4xl"} fontWeight={"bold"}>
            Publish A New Project ????{" "}
          </Text>
          <Text>{/**Some text goes here*/}</Text>
          <Box mt={10} display={["none", "block"]}>
            {/* <Text fontSize={"xl"}><b>Progress</b></Text> */}
            <UnorderedList display="flex" gap="20px">
              <ListItem
                my={2}
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="10px"
                // textDecoration={githubURL && "line-through"}
                // color={githubURL && "gray.400"}
              >
                <Check done={!!!githubURL} />
                Repository
              </ListItem>
              {/* <ListItem
                 my={2}
                 display="flex"
                 alignItems="center"
                 flexDirection="column"
                 gap="10px"
              >
               <Check done={!!!projectName} />
                Name
              </ListItem> */}
              <ListItem
                my={2}
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="10px"
              >
                <Check done={!!!description} />
                Description
              </ListItem>
              <ListItem
                my={2}
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="10px"
              >
                <Check done={!!!validurl} />
                Link (Optional)
              </ListItem>
              <ListItem
                my={2}
                display="flex"
                alignItems="center"
                flexDirection="column"
                gap="10px"
              >
                <Check done={selectedTags.length < 1} />
                Tech-stack
              </ListItem>
            </UnorderedList>
          </Box>
        </Flex>
        <Flex>
          <Tabs index={tabIndex} onChange={handleTabsChange}>
            <TabList>
              <Tab>Repository</Tab>
              <Tab isDisabled={!githubURL}>Details</Tab>
              <Tab isDisabled={!projectName || !description || !githubURL}>
                Tech stack
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {githubURL === "" && (
                  <Input
                    placeholder={"Search repository"}
                    my={2}
                    h="60px"
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                  />
                )}

                {githubURL !== "" && (
                  <Button
                    bg="linear-gradient(to left, #805ad5 0%, #d53f8c 100%)"
                    fontSize="13px"
                    p={0.5}
                    my={3}
                    maxW={350}
                    h="60px"
                  >
                    <Flex
                      overflow="hidden"
                      align={"center"}
                      bg={"#000"}
                      my={3}
                      w={"100%"}
                      h={"100%"}
                      p={"10px"}
                      cursor={"pointer"}
                      borderRadius={"5px"}
                    >
                      <Icon as={SiGithub} h={5} w={5} mr={2} />
                      <Text>{repoFullname}</Text>
                    </Flex>
                    <CloseButton
                      onClick={() => {
                        setGithubURL("");
                        setProjectName("");
                        setDescription("");
                        setValidURL(false);
                      }}
                    />
                  </Button>
                )}
                <Flex direction="column" gap="15px">
                  {!query ? (
                    <></>
                  ) : githubURL !== "" ? (
                    <></>
                  ) : (
                    repos
                      .filter((r: RepoData) =>
                        r.name.toLowerCase().includes(query.toLowerCase())
                      )
                      .map((repo: RepoData, i) => (
                        <Button
                          bg="linear-gradient(to left, #805ad5 0%, #d53f8c 100%)"
                          fontSize="13px"
                          p={0.5}
                          m={3}
                          w="80vw"
                          position="relative"
                          maxW={"350px"}
                          key={i}
                        >
                          <Flex
                            align={"center"}
                            overflow="hidden"
                            bg={"#000"}
                            my={3}
                            w={"100%"}
                            h={"100%"}
                            p={0.5}
                            cursor={"pointer"}
                            borderRadius={"5px"}
                            onClick={() => {
                              setGithubURL(repo.svn_url);
                              setProjectName(repo.name);
                              setQuery("");
                              setRepoFullname(repo.full_name);
                            }}
                          >
                            <Icon as={SiGithub} h={5} w={5} mr={2} />
                            <Text color={"grey.100"}>{username}/</Text>
                            <Text>{repo.name}</Text>
                          </Flex>
                        </Button>
                      ))
                  )}
                </Flex>

                <Box>
                  <Button
                    disabled={!githubURL}
                    onClick={() => {
                      handleTabsChange(1);
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </TabPanel>
              <TabPanel>
                <Input
                  placeholder={"Project name"}
                  p="14px"
                  h="60px"
                  w="100%"
                  my={2}
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                  }}
                />
                <Input
                  placeholder={"Project description"}
                  p="14px"
                  h="60px"
                  my={2}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                  placeholder={"Website"}
                  p="14px"
                  h="60px"
                  my={2}
                  onChange={(e) => {
                    setWebsiteURL(e.target.value);
                    setValidURL(testUrl(e.target.value));
                  }}
                />
                <Button
                  disabled={
                    !projectName ||
                    !description ||
                    (websiteURL !== "" && !validurl)
                  }
                  onClick={() => handleTabsChange(2)}
                >
                  Continue
                </Button>
              </TabPanel>
              <TabPanel>
                <Flex direction={"column"}>
                  <Flex my={2} gap={2}>
                    {selectedTags.map((tag, i) => (
                      <Tag key={i}>
                        <TagLeftIcon>{tag.logo}</TagLeftIcon>
                        {tag.name}
                        <TagCloseButton
                          onClick={() => {
                            setSelectedTags(
                              selectedTags.filter((t) => t !== tag)
                            );
                          }}
                        />
                      </Tag>
                    ))}
                  </Flex>
                  <Input
                    placeholder={"Search"}
                    h="60px"
                    my={4}
                    ref={stackQueryRef}
                    onChange={(e) => {
                      let timer;
                      if (timer) {
                        clearInterval(timer);
                      }
                      timer = setTimeout(() => {
                        setStackQuery(e.target.value);
                      }, 300);
                    }}
                  />
                  <Flex direction={"column"}>
                    {stackQuery !== "" &&
                      ts
                        .filter(
                          (t) =>
                            t.name
                              .toLowerCase()
                              .includes(stackQuery.toLowerCase()) &&
                            !selectedTags.includes(t)
                        )
                        .map((tag, i) => (
                          <Tag
                            key={i}
                            my={2}
                            onClick={() => {
                              setSelectedTags([...selectedTags, tag]);
                              setTechStack([...techStack, tag.name]);
                              setStackQuery("");
                              stackQueryRef.current.value = "";
                            }}
                          >
                            <Text>{tag.name}</Text>
                          </Tag>
                        ))}
                  </Flex>
                  <Button
                    disabled={selectedTags.length < 1}
                    onClick={publishProject}
                  >
                    {publishing ? <Spinner size={"lg"} /> : "Publish Project"}
                  </Button>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </>
  );
};

export default AddNewProject;
