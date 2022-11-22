import { Component, createSignal, For, Show } from 'solid-js';
import { Game, Odd, Prediction } from '../models';
import { Transition } from 'solid-transition-group';
import { Menu, MenuItem } from 'solid-headless';
import { getRouteMatches } from '@solidjs/router/dist/routing';

interface IBetCards {
  game: Game;
  prediction?: Prediction;
}

export const Card: Component<IBetCards> = (props: IBetCards) => {
  let game = props.game;
  const [showDropdown, setShowDropdown] = createSignal(false);

  const getWinner = (game: Game) => {
    let home_score = game.home_team_score;
    let away_score = game.away_team_score;

    let home_score_int = parseInt(home_score);
    let away_score_int = parseInt(away_score);

    return home_score_int > away_score_int ? game.home_team_name : game.away_team_name;
  };

  const getPredictionAgainstOdds = (odd: Odd, prediction: Prediction) => {
    let home_team_winning = odd.home_team_odds > odd.away_team_odds;

    return home_team_winning ? "WITH": "AGAINST"
  };

  return (
    <div class="max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 bg-gray-800 hover:hover:bg-gray-700/10 text-white">
      <h5 class="flex mb-1 text-2xl flex-row justify-center items-center" onClick={() => setShowDropdown(!showDropdown())}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 hover:text-gray-400 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        {`${game.home_team_name} vs ${game.away_team_name}`}
      </h5>
      <Show when={game.home_team_score != '' || game.away_team_score != ''} keyed>
        <div class="flex flex-row justify-center">
          <Show when={game.away_team_score !== '0' || game.home_team_score != '0'} keyed>
            <h6 class="text-s">{game.home_team_score}</h6>
            <h6 class="text-s mx px-2">-</h6>
            <h6 class="text-s">{game.away_team_score}</h6>
          </Show>
        </div>
      </Show>
      <div class="flex flex-row justify-center ">{game.start_time.includes('ET') ? `Starting @ ${game.start_time}` : game.start_time.includes('Final') ? game.start_time : `Current Quarter: ${game.start_time}`}</div>
      <Show when={props.prediction} keyed>
        <div class="flex font-extrabold flex-row justify-center">{`Our Projected Winner: ${props.prediction?.predicted_winner} `}</div>
      </Show>
      <Show when={game.start_time.includes('Final')} keyed>
        <div class="flex flex-row justify-center">{`Winner: ${getWinner(game)}`}</div>
      </Show>
      <Transition name="slide-fade">
        {showDropdown() && (
          <div class="overflow-x-auto relative mt-4">
            <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <For each={game.odds.length > 0 && Object.keys(game.odds[0])}>{(key) => <th class="px-4 py-3">{key.replace('home_team', game.home_team_name).replace('away_team', game.away_team_name).replace(/_/g, ' ')}</th>}</For>
                  <Show when={props.prediction} keyed>
                    <th class="px-4 py-3">Our bet</th>
                  </Show>
                </tr>
              </thead>
              <tbody>
                <For each={game.odds}>
                  {(odd) => (
                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th class="py-4 px-6">{odd.book_name}</th>
                      <th class="py-4 px-6">{odd.home_team_odds}</th>
                      <th class="py-4 px-6">{odd.away_team_odds}</th>
                      <th class="py-4 px-6">{odd.home_team_odds_trend}</th>
                      <th class="py-4 px-6">{odd.away_team_odds_trend}</th>
                      <th class="py-4 px-6">{odd.home_team_opening_odds}</th>
                      <th class="py-4 px-6">{odd.away_team_opening_odds}</th>
                      <Show when={props.prediction} keyed>
                        <th class="py-4 px-6">{getPredictionAgainstOdds(odd!, props.prediction!)}</th>
                      </Show>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        )}
      </Transition>
    </div>
  );
};
