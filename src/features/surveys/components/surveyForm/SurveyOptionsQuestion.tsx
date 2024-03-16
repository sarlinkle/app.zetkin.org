import SurveyContainer from './SurveyContainer';
import SurveyOption from './SurveyOption';
import SurveyQuestionDescription from './SurveyQuestionDescription';
import SurveySubheading from './SurveySubheading';
import {
  Box,
  Checkbox,
  FormControl,
  FormGroup,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { FC, useCallback, useState } from 'react';
import {
  ZetkinSurveyOption,
  ZetkinSurveyOptionsQuestionElement,
} from 'utils/types/zetkin';

export type OptionsQuestionProps = {
  element: ZetkinSurveyOptionsQuestionElement;
};

const OptionsQuestion: FC<OptionsQuestionProps> = ({ element }) => {
  const [dropdownValue, setDropdownValue] = useState('');
  const handleDropdownChange = useCallback((event: SelectChangeEvent) => {
    setDropdownValue(event.target.value);
  }, []);

  return (
    <FormControl fullWidth>
      <SurveyContainer>
        {element.question.response_config.widget_type === 'checkbox' && (
          <FormGroup
            aria-describedby={`description-${element.id}`}
            aria-labelledby={`label-${element.id}`}
          >
            <Box
              display="flex"
              flexDirection="column"
              maxWidth={{ sm: 'sm' }}
              overflow={'hidden'}
              rowGap={2}
              width="100%"
            >
              <Box>
                <FormLabel id={`label-${element.id}`}>
                  <SurveySubheading>
                    {element.question.question}
                  </SurveySubheading>
                </FormLabel>
                {element.question.description && (
                  <SurveyQuestionDescription id={`description-${element.id}`}>
                    {element.question.description}
                  </SurveyQuestionDescription>
                )}
              </Box>
              <Box display="flex" flexDirection="column" rowGap={1}>
                {element.question.options!.map((option: ZetkinSurveyOption) => (
                  <SurveyOption
                    key={option.id}
                    control={<Checkbox name={`${element.id}.options`} />}
                    label={option.text}
                    value={option.id}
                  />
                ))}
              </Box>
            </Box>
          </FormGroup>
        )}
        {(element.question.response_config.widget_type === 'radio' ||
          typeof element.question.response_config.widget_type ===
            'undefined') && (
          <RadioGroup
            aria-describedby={`description-${element.id}`}
            aria-labelledby={`label-${element.id}`}
            name={`${element.id}.options`}
          >
            <Box
              display="flex"
              flexDirection="column"
              maxWidth={{ sm: 'sm' }}
              overflow={'hidden'}
              rowGap={2}
              width="100%"
            >
              <Box display="flex" flexDirection="column">
                <Box>
                  <FormLabel id={`label-${element.id}`}>
                    <SurveySubheading>
                      {element.question.question}
                    </SurveySubheading>
                  </FormLabel>
                  {element.question.description && (
                    <SurveyQuestionDescription id={`description-${element.id}`}>
                      {element.question.description}
                    </SurveyQuestionDescription>
                  )}
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" rowGap={1}>
                {element.question.options!.map((option: ZetkinSurveyOption) => (
                  <SurveyOption
                    key={option.id}
                    control={<Radio />}
                    label={option.text}
                    value={option.id}
                  />
                ))}
              </Box>
            </Box>
          </RadioGroup>
        )}
        {element.question.response_config.widget_type === 'select' && (
          <FormGroup
            aria-describedby={`description-${element.id}`}
            aria-labelledby={`label-${element.id}`}
          >
            <Box display="flex" flexDirection="column" rowGap={2}>
              <Box display="flex" flexDirection="column">
                <FormLabel id={`label-${element.id}`}>
                  <SurveySubheading>
                    {element.question.question}
                  </SurveySubheading>
                </FormLabel>
                {element.question.description && (
                  <SurveyQuestionDescription id={`description-${element.id}`}>
                    {element.question.description}
                  </SurveyQuestionDescription>
                )}
              </Box>
              <Select
                aria-labelledby={`label-${element.id}`}
                name={`${element.id}.options`}
                onChange={handleDropdownChange}
                value={dropdownValue}
              >
                {element.question.options!.map((option: ZetkinSurveyOption) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.text}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </FormGroup>
        )}
      </SurveyContainer>
    </FormControl>
  );
};

export default OptionsQuestion;
