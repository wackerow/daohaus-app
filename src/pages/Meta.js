import React, { useEffect, useState } from 'react';
import { Box, Flex, Icon } from '@chakra-ui/react';
import { useHistory, useParams, Link as RouterLink } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';

import { useMetaData } from '../contexts/MetaDataContext';
import { useDaoMember } from '../contexts/DaoMemberContext';
import DaoMetaForm from '../forms/daoMetaForm';

const Meta = () => {
  const { apiMetaData, refetchMetaData } = useMetaData();
  const { isMember } = useDaoMember();
  const [localMetadata, setLocalMetadata] = useState();
  const history = useHistory();
  const { daochain, daoid } = useParams();

  useEffect(() => {
    if (apiMetaData && !localMetadata) {
      setLocalMetadata({
        address: apiMetaData.contractAddress,
        name: apiMetaData.name,
        description: apiMetaData.description,
        purpose: apiMetaData.purpose,
        links: apiMetaData.links,
        avatarImg: apiMetaData.avatarImg,
        version: apiMetaData.version,
        tags: apiMetaData.tags,
      });
    }
  }, [apiMetaData, localMetadata]);

  const handleUpdate = (newDaoData) => {
    refetchMetaData();
    history.push(`/dao/${daochain}/${daoid}/settings`);
  };

  return (
    <Flex wrap='wrap'>
      <Flex ml={6} justify='space-between' align='center' w='100%'>
        <Flex as={RouterLink} to={`/`} align='center'>
          <Icon as={BiArrowBack} color='secondary.500' mr={2} />
          Back
        </Flex>
      </Flex>
      {isMember ? (
        <Box w='40%'>
          <DaoMetaForm handleUpdate={handleUpdate} metadata={localMetadata} />
        </Box>
      ) : (
        <Box
          rounded='lg'
          bg='blackAlpha.600'
          borderWidth='1px'
          borderColor='whiteAlpha.200'
          p={6}
          m={[10, 'auto', 0, 'auto']}
          w='50%'
          textAlign='center'
          fontSize={['lg', null, null, '3xl']}
          fontFamily='heading'
          fontWeight={700}
        >
          Members Only
        </Box>
      )}
    </Flex>
  );
};

export default Meta;
