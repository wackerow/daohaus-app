import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flex, Box, Divider, Center, Skeleton } from '@chakra-ui/react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

import ContentBox from '../components/ContentBox';
import { Bold, CardLabel, ParaMd, ParaSm } from '../components/typography';
import PropActions from './propActions';
import useMinionAction from '../hooks/useMinionAction';
import { CUSTOM_DISPLAY } from '../data/proposalData';
import {
  generateOfferText,
  generateRequestText,
  readableTokenBalance,
} from '../utils/proposalCard';
import { useDao } from '../contexts/DaoContext';

const ProposalCardV2 = ({ proposal, interaction }) => {
  return (
    <ContentBox p='0' mb={4} minHeight='8.875rem'>
      <Flex>
        <PropCardBrief proposal={proposal} />
        <Center height='100%' minHeight='8.875rem'>
          <Divider orientation='vertical' colorScheme='blackAplha.900' />
        </Center>
        <Flex w='40%'>
          <PropActions proposal={proposal} interaction={interaction} />
        </Flex>
      </Flex>
    </ContentBox>
  );
};

const DetailsLink = ({ proposalId }) => {
  const { daochain, daoid } = useParams();
  return (
    <Box position='absolute' top='0.5rem' right='1rem'>
      <Link to={`/dao/${daochain}/${daoid}/proposals/${proposalId}`}>
        <ParaSm>More Details</ParaSm>
      </Link>
    </Box>
  );
};

const PropCardBrief = ({ proposal = {} }) => {
  const isOffering = Number(proposal.tributeOffered) > 0;
  const isRequesting =
    Number(proposal.lootRequested) > 0 ||
    Number(proposal.sharesRequested) > 0 ||
    Number(proposal.paymentRequested) > 0;
  const { customTransferUI } = CUSTOM_DISPLAY[proposal.proposalType] || {};

  return (
    <Flex
      width='60%'
      justifyContent='space-between'
      borderRight='1px solid rgba(255,255,255,0.1)'
      position='relative'
    >
      <Box px='1.2rem' py='0.6rem'>
        <CardLabel mb={2}>{proposal.proposalType}</CardLabel>
        <ParaMd fontWeight='700' mb={3}>
          {proposal.title}
        </ParaMd>
        {isRequesting && <PropCardRequest proposal={proposal} />}
        {isOffering && <PropCardOffer proposal={proposal} />}
        {customTransferUI && (
          <CustomTransfer
            proposal={proposal}
            customTransferUI={customTransferUI}
          />
        )}
      </Box>
      <DetailsLink proposalId={proposal.proposalId} />
    </Flex>
  );
};

const PropCardRequest = ({ proposal }) => {
  const requestText = useMemo(() => {
    if (proposal) {
      return generateRequestText(proposal);
    }
  }, [proposal]);
  return (
    <PropCardTransfer incoming action='Requesting' itemText={requestText} />
  );
};

const PropCardOffer = ({ proposal }) => {
  const requestText = useMemo(() => {
    if (proposal) {
      return generateOfferText(proposal);
    }
  }, [proposal]);
  return <PropCardTransfer outgoing action='Offering' itemText={requestText} />;
};

const MinionTransfer = ({ proposal = {} }) => {
  const { minionAddress } = proposal;
  const minionAction = useMinionAction(proposal);
  const { daoVaults } = useDao();
  console.log(`proposal`, proposal);

  const itemText = useMemo(() => {
    if (!daoVaults || minionAction?.status !== 'success' || !minionAddress)
      return;
    const tokenAddress = minionAction.to;

    const vault = daoVaults?.find(minion => minion.address === minionAddress);
    const tokenData = vault?.erc20s.find(
      token =>
        token.tokenAddress?.toLowerCase() === tokenAddress?.toLowerCase(),
    );
    const { balance, name, decimals } = tokenData || {};
    if (balance && name && decimals && vault) {
      return `Requesting ${readableTokenBalance({
        balance,
        symbol: name,
        decimals,
      })} from ${vault?.name || 'Minion'}`;
    }

    return 'Error Retriving token data';
  }, [daoVaults && minionAction && !minionAddress]);

  const isLoaded =
    minionAction?.status === 'error' || minionAction?.status === 'success';
  return (
    <AsyncCardTransfer
      isLoaded={isLoaded}
      proposal={proposal}
      incoming
      itemText={itemText}
    />
  );
};

const CustomTransfer = ({ proposal, customTransferUI }) => {
  if (customTransferUI === 'minionTransfer') {
    return <MinionTransfer proposal={proposal} />;
  }
  return null;
};

const AsyncCardTransfer = props => {
  const { isLoaded } = props;
  return (
    <Skeleton isLoaded={isLoaded} height='1.5rem'>
      <PropCardTransfer {...props} />
    </Skeleton>
  );
};

const PropCardTransfer = ({
  incoming,
  outgoing,
  itemText,
  action,
  specialLocation,
}) => {
  return (
    <Flex alignItems='center' mb='2'>
      {incoming && (
        <Box transform='translateY(1px)'>
          <RiArrowRightLine size='1.1rem' />
        </Box>
      )}
      {outgoing && (
        <Box transform='translateY(1px)'>
          <RiArrowLeftLine size='1.1rem' />
        </Box>
      )}
      {specialLocation ? (
        <ParaMd ml='1'>
          {action}
          <Bold> {itemText} </Bold> to <Bold> {specialLocation}</Bold>
        </ParaMd>
      ) : (
        <ParaMd ml='1'>
          {action}
          <Bold> {itemText} </Bold>
        </ParaMd>
      )}
    </Flex>
  );
};

export default ProposalCardV2;