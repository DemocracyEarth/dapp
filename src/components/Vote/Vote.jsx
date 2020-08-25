import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';

import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';
import Stamp from 'components/Stamp/Stamp';
import Transaction from 'components/Transaction/Transaction';

import { defaults } from 'lib/const';
import { config } from 'config'
import 'styles/Dapp.css';

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

const VOTE_DATA = `
  id
  createdAt
  uintVote
  molochAddress
  memberAddress
  proposal {
    details
    id
  }
  member {
    shares
  }
`

const GET_VOTES = gql`
  query addressVotes($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    votes(first: $first, skip: $skip, orderBy:$orderBy, orderDirection:$orderDirection) {
      ${VOTE_DATA}
    }
  }
`;

const GET_VOTES_FROM_ADDRESS = gql`
  query memberProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    votes(first: $first, skip: $skip, where: { memberAddress: $address } orderBy:$orderBy, orderDirection:$orderDirection) {
      ${VOTE_DATA}
    }
  }
`;

const composeQuery = (address) => {
  if (address === defaults.EMPTY) {
    return GET_VOTES;
  }
  return GET_VOTES_FROM_ADDRESS;
}

/**
* @summary displays the contents of a poll
*/
/**
* @summary graph query of token
* @param {string} publicAddress of the token contract
* @param {string} quantity with a big number
* @param {string} symbol with a ticker
* @param {string} decimal numbers this token takes
*/
const VoteQuery = (props) => {
  const { address, first, skip, orderBy, orderDirection } = props;  
  const { loading, error, data } = useQuery(composeQuery(props.address), { variables: { address, first, skip, orderBy, orderDirection } });

  if (loading) {
    return (
      <div className="token">
        <div className="token-ticker">
          <div className="option-placeholder token-placeholder" />
        </div>
      </div>
    );
  }
  if (error) return `Error! ${error}`;

  return data.votes.map((vote) => {
    return (
      <div key={vote.id} className="event-vote">
        <Account publicAddress={vote.memberAddress} width="16px" height="16px" />
        <DAO publicAddress={vote.molochAddress} width="16px" height="16px" />
        <Transaction uintVote={vote.uintVote} description={vote.proposal.details} quantity={vote.member.shares} />
        <Stamp timestamp={vote.createdAt} format="timeSince" />
      </div>
    );
  });
};

VoteQuery.propTypes = {
  address: PropTypes.string,
  first: PropTypes.number,
  skip: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
};


/**
* @summary renders a post in the timeline
*/
const Vote = (props) => {
  return (
    <ApolloProvider client={client}>
      <VoteQuery address={props.address} first={props.first} skip={props.skip} orderBy={props.orderBy} orderDirection={props.orderDirection} />
    </ApolloProvider>
  );
};

Vote.propTypes = VoteQuery.propTypes;


export default Vote;
