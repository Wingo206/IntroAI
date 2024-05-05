%% load data 
maxDigits = 5000;
[digitImagesArray, labels] = loadTrain(1, maxDigits);
%% train perceptron 
%weight = zeros(28*28 + 1,10);
%100A - full run, 0.01 learnning rate, 15 min? 
%100B - full run, 1 learning rate?, 10 min?
%100C - 300 epoch, learning rate 1, 30 sec, 0.8210

totalTrialTimes = zeros(10, 1);
totalTrialWeights = zeros((28*28+1), 10, 10);

for k = 1:10
    disp("PERCENTAGE: " + 0.1*(k));
    [digitImagesArray, labels] = loadTrain((0.1*(k)), maxDigits);
    trialWeights = zeros((28*28+1),10,5);
    trialTimes = zeros(5,1);
    numberOfImages = round(0.1*(k)*maxDigits);

    for t = 1:5
        disp("TRIAL: " + t);
        tic;

        weight = rand(28*28 + 1, 10);
        learningRate = 1;
        changeMade = true;
        counter = 0;
        epochs = 30;
        epochCounter = 0;

        for j = 1 : epochs
            changeMade = false;
            counter = 0;
            for i = 1 : numberOfImages
                predictions = zeros(1,10);
                currentImage = ones(28*28 + 1, 1);
                currentImage(2:end) = reshape(digitImagesArray(:,:,i), [28*28,1]);
                currentImage = repmat(currentImage, [1, 10]);
                z = currentImage .* weight;
                predictions = sum(z);
                currentLabel = zeros(1, 10);
                currentLabel(labels(i) + 1) = 1;
                normalizedPredictions = predictions > 0;
                adjustedMask = currentLabel - normalizedPredictions;
                adjustedMask = repmat(adjustedMask, [28*28+1,1]);
                weight = weight + learningRate * adjustedMask .* currentImage;
                currentChangeMade = sum(abs(adjustedMask), "all") > 0;
                changeMade = changeMade || currentChangeMade;
                counter = counter + currentChangeMade;
            end
            disp(counter);
            epochCounter = epochCounter + 1
        end

        trialTimes(t,1) = toc;
        trialWeights(:,:,t) = weight;
    end
    mean_weight = mean(trialWeights, 3);

    totalTrialWeights(:,:,k) = reshape(mean_weight, [(28*28+1), 10, 1]);
    totalTrialTimes(k,1) = mean(trialTimes);

    writematrix(totalTrialWeights(:,:,k), "perceptronWeightsDigit" + (0.1*k) + ".csv");
end
%% test perceptron
weight = csvread("perceptronWeightsDigit1.csv");
digitValidationFile = fopen("digitdata/validationimages", "r");
digitValidationLabelFile = fopen("digitdata/validationlabels", "r");
digitTestFile = fopen("digitdata/testimages", "r");
digitTestLabelFile = fopen("digitdata/testlabels", "r");

[digitImagesArray, validationLabels] = imageFileToMatrix(digitValidationFile, digitValidationLabelFile);
[digitImagesArray2, validationLabels2] = imageFileToMatrix(digitTestFile, digitTestLabelFile);

totalTrialAccuracies = zeros(10,1);
totalTrialStd = zeros(10,1);

for k=1:10
    
trialAccuracices = zeros(5,1);

    for t = 1 : 5
        results = zeros(1,1000);

        for i = 1 : 1000
               predictions = zeros(1,1);
               currentImage = ones(28*28 + 1, 1);
               currentImage(2:end) = reshape(digitImagesArray(:,:,i), [28*28,1]);
               currentImage = repmat(currentImage, [1, 10]);
               z = currentImage .* totalTrialWeights(:,:,k);
               predictions = sum(z);
               [~, predictedDigit] = max(predictions);
               predictedDigit = predictedDigit - 1;
               results(i) = validationLabels(i) == predictedDigit;
        end
        trialAccuracices(t,1) = mean(results);
    end
    
    totalTrialStd(k,1) = std(trialAccuracices);
    totalTrialAccuracies(k,1) = mean(trialAccuracices);
end

%change last number for single Testing 
[predicted, real] = singleTest(digitImagesArray2, weight, validationLabels2, 10)
%% Graph Data

totalPercentages = 0.1:0.1:1;

x = totalPercentages;
y = totalTrialAccuracies;

% Plot 1
plot(x, y, 'b-', 'LineWidth', 2); 
axis([0.1 1 0 1]);
xlabel('Percentages of Training Data Used');
ylabel('Average Accuracy');
title('Accuracy vs Percentages (5 trials each)'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialTimes;

% Plot 2
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Average Time in s');
title('Time vs Percentages (5 trials each)'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialStd;

% Plot 3
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Standard deviation over 5 trials ');
title('Std vs Percentages'); 
grid on; 
%10^-15
ylim([0 0.000000000000001]);

%% Functions

function [predicted, real] = singleTest(digitImagesArray, weight, validationLabels, image)
       predictions = zeros(1,10);
       currentImage = ones(28*28 + 1, 1);
       currentImage(2:end) = reshape(digitImagesArray(:,:,image), [28*28,1]);
       currentImage = repmat(currentImage, [1, 10]);
       z = currentImage .* weight;
       predictions = sum(z);
       [~, predictedDigit] = max(predictions);
       predicted = predictedDigit - 1;
       real = validationLabels(image);
end

function [outputArray, validationLabels] = imageFileToMatrix(testingFileImage, testingFileLabels)
    line = fgetl(testingFileImage)
    digitImagesArray = zeros(28,28,1000);
    imageCounter = 1;
    increment = 1;
    currentDigitImage = zeros(28,28);
    while(ischar(line))
        currentDigitImage(increment,:) = (line == 43) + 2*(line == 35);
        increment = increment + 1;
        if (increment > 28)
            digitImagesArray(:,:,imageCounter) = currentDigitImage;
            imageCounter = imageCounter + 1;
            increment = 1;
            currentDigitImage = zeros(28,28);
        end
        line = fgetl(testingFileImage);
    end
    outputArray = digitImagesArray;
    validationLabels = fscanf(testingFileLabels, "%d");
end

function [digitImagesArray, labels] = loadTrain(percentage, totalImages)
    numberOfImages = round(percentage * totalImages);
    digitTrainingFile = fopen("digitdata/trainingimages", "r");
    digitTrainingLabelsFile = fopen("digitdata/traininglabels", "r");
    labels = fscanf(digitTrainingLabelsFile, "%d");
    line = fgetl(digitTrainingFile)
    digitImagesArray = zeros(28,28,numberOfImages);
    imageCounter = 1;
    increment = 1;
    currentDigitImage = zeros(28,28);

    while(ischar(line))
        currentDigitImage(increment,:) = (line == 43) + 2*(line == 35);
        increment = increment + 1;
        if (increment > 28)
            digitImagesArray(:,:,imageCounter) = currentDigitImage;
            imageCounter = imageCounter + 1;
            increment = 1;
            currentDigitImage = zeros(28,28);
        end
        line = fgetl(digitTrainingFile);
    end
end