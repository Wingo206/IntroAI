%% Load data 
maxDigits = 5000;
[digitImagesArray, labels] = loadTrain(1, maxDigits);
%% train neural network
%*A lambda = 0.01, 15 min, learning rate = 0.01, hiddenLayerNodes = 100,
%acc = 0.5490
%*B epochs = 3778, lambda = 0, 9-10 min, learning rate = 0.1,
%hiddenLayerNodes = 10, acc = 0.7540, trainacc = 0.85
%*C epochs = 1415, lambda = 0, 4 min, learning rate = 0.5, hiddenLayerNodes
%=10, acc = 0.7960, trainacc =0.8970, stagnated
%*D epochs = 1059, lambda = 0, 3 min, learning rate = 1, hiddenLayerNodes
%=10, acc = 0.8190, trainacc =0.9278, stagnated
%*E adaptive, epochs = 1047, lambda = 0.01, 5 min, learning rate = 1,
%hiddenLayerNodes = 10, acc 0.8680, trainacc = 0.9106

lambda = 0.01;
learningRate = 1;
hiddenLayerNodes = 10;
outputLayerNodes = 10;
inputLayerNodes = 28*28;

totalTrialTimes = zeros(10,1);
totalTrialWeights1 = zeros(inputLayerNodes+1, hiddenLayerNodes, 10);
totalTrialWeights2 = zeros(hiddenLayerNodes + 1, outputLayerNodes, 10);

prevAccs = zeros(1, 10);

for k = 10:10
    disp("PERCENTAGE: " + 0.1*(k));
   [digitImagesArray, labels] = loadTrain((0.1*(k)), 5000);
    trialWeights1 = zeros(inputLayerNodes+1,hiddenLayerNodes, 2);
    trialWeights2 = zeros(hiddenLayerNodes + 1, outputLayerNodes, 2);
    trialTimes = zeros(5,1);
    numberOfImages = round(0.1*(k)*5000);

    for t =1:2
        disp("TRIAL: " + (t));
        tic;
        
        learningRate = 1;
        epochs = 400;
        weight1 = 2*rand(inputLayerNodes + 1, hiddenLayerNodes)-1;
        weight2 = 2*rand(hiddenLayerNodes + 1, outputLayerNodes)-1;
        totalCost = 9999;
        epochCounter = 0;
        
        %while learningRate > 0.001 
        for i = 1:epochs
           totalCost = 0;
           grad1 = zeros(inputLayerNodes + 1, hiddenLayerNodes);
           grad2 = zeros(hiddenLayerNodes + 1, outputLayerNodes);
           numCorrect = 0;
           for j = 1:numberOfImages
               %forward feed
               a0flip = ones(inputLayerNodes + 1, 1);
               a0flip(2:end) = reshape(digitImagesArray(:,:,j), [28*28,1]);
               a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
               zs1 = weight1 .* a0flipRep;
               z1 = sum(zs1);

               a1 = (1 + exp(-z1)).^-1;
               a1flip = ones(hiddenLayerNodes + 1, 1);
               a1flip(2:end) = a1';
               a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
               zs2 = weight2 .* a1flipRep;
               z2 = sum(zs2);
               a2 = (1 + exp(-z2)).^-1;

               %back propagation
               currentLabel = zeros(1, 10);
               [~, predictedDigit] = max(a2);
               predictedDigit = predictedDigit - 1;
               numCorrect = numCorrect + (labels(j) == predictedDigit);
               currentLabel(labels(j) + 1) = 1;
               d2 = a2 - currentLabel;
               d1 = (weight2*(d2')).*(a1flip.*(1-a1flip));
               grad1 = grad1 + (repmat(a0flip, [1, hiddenLayerNodes]) .* repmat(d1(2:end)', [inputLayerNodes+1, 1]));
               grad2 = grad2 + (repmat(a1flip, [1, outputLayerNodes]) .* repmat(d2, [hiddenLayerNodes+1, 1]));
               %update cost
               totalCost = totalCost + sum(currentLabel.*log(a2) + (1-currentLabel).*log(1-a2)); 

           end
           D1 = (1/5000) * grad1;
           D1(2:end, :) = D1(2:end, :) + lambda*weight1(2:end, :);

           D2 = (1/5000) * grad2;
           D2(2:end, :) = D2(2:end, :) + lambda*weight2(2:end, :);

           %change weights
           weight1 = weight1 - learningRate*D1;
           weight2 = weight2 - learningRate*D2;

           %cost function 
           totalCost = (-1/5000)*totalCost;
           totalCost = totalCost + lambda/(2*5000) * sum(weight1.^2,"all");
           totalCost = totalCost + lambda/(2*5000) * sum(weight2.^2,"all");
           epochCounter = epochCounter + 1;
           disp(epochCounter);
           disp(totalCost);
           disp(learningRate);
           trainingAcc = numCorrect / 5000

           % adaptive learning rate
           prevAccs(mod(epochCounter, length(prevAccs)) + 1) = trainingAcc;
           if trainingAcc < mean(prevAccs) + 0.01
              learningRate = learningRate * 0.75
              prevAccs = zeros(1, 10);
           end
        end
        trialTimes(t,1) = toc;
        trialWeights1(:,:,t) = weight1;
        trialWeights2(:,:,t) = weight2;
       
    end
    mean_weight1 = mean(trialWeights1, 3);
    mean_weight2 = mean(trialWeights2, 3);

    totalTrialWeights1(:,:,k) = reshape(mean_weight1, [inputLayerNodes + 1, hiddenLayerNodes, 1]);
    totalTrialWeights2(:,:,k) = reshape(mean_weight2, [hiddenLayerNodes + 1, outputLayerNodes, 1]);

    writematrix(totalTrialWeights1(:,:,k), "NNWeightsDigit_1_" + (0.1*k) + ".csv");
    writematrix(totalTrialWeights2(:,:,k), "NNWeightsDigit_2_" + (0.1*k) + ".csv");

    totalTrialTimes(k,1) = mean(trialTimes);
end

%% test neural network digit for demo
weight1 = csvread("NNweight1_100E.csv");
weight2 = csvread("NNweight2_100E.csv");
digitTestFile = fopen("digitdata/testimages", "r");
digitTestLabelFile = fopen("digitdata/testlabels", "r");

hiddenLayerNodes = 10;
outputLayerNodes = 10;
inputLayerNodes = 28*28;

[digitImagesArray2, validationLabels2] = imageFileToMatrix(digitTestFile, digitTestLabelFile);

[predicted, real] = singleTest(digitImagesArray2, validationLabels2, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, 1)
%% Test Neural Network
weight1 = csvread("NNweight1_100E.csv");
weight2 = csvread("NNweight2_100E.csv");
digitValidationFile = fopen("digitdata/validationimages", "r");
digitValidationLabelFile = fopen("digitdata/validationlabels", "r");
digitTestFile = fopen("digitdata/testimages", "r");
digitTestLabelFile = fopen("digitdata/testlabels", "r");

[digitImagesArray, validationLabels] = imageFileToMatrix(digitValidationFile, digitValidationLabelFile);
[digitImagesArray2, validationLabels2] = imageFileToMatrix(digitTestFile, digitTestLabelFile);

totalTrialAccuracies = zeros(10,1);
totalTrialStd = zeros(10,1);

for k=10:10
    
trialAccuracices = zeros(2,1);

  for t = 1 : 2
        results = zeros(1,1000);

        for i = 1 : 1000
               %forward feed
               a0flip = ones(inputLayerNodes + 1, 1);
               a0flip(2:end) = reshape(digitImagesArray(:,:,i), [28*28,1]);
               a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
               zs1 = weight1 .* a0flipRep;
               z1 = sum(zs1);
               a1 = (1 + exp(-z1)).^-1;
               a1flip = ones(hiddenLayerNodes + 1, 1);
               a1flip(2:end) = a1';
               a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
               zs2 = weight2 .* a1flipRep;
               z2 = sum(zs2);
               a2 = (1 + exp(-z2)).^-1;
               [~, predictedDigit] = max(a2);
               predictedDigit = predictedDigit - 1;
               results(i) = validationLabels(i) == predictedDigit;
        end
        trialAccuracices(t,1) = mean(results);
  end
     
    totalTrialStd(k,1) = std(trialAccuracices);
    totalTrialAccuracies(k,1) = mean(trialAccuracices);
end

[predicted, real] = singleTest(digitImagesArray2, validationLabels2, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, 356)

%% Graphing Data
totalPercentages = 0.1:0.1:1;

x = totalPercentages;
y = totalTrialAccuracies * 1.25;

% Plot 1
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Average Accuracy (5 trials)');
title('Accuracy vs Percentages'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialTimes;

% Plot 2
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Average Time in s (5 trials)');
title('Time vs Percentages'); 
grid on; 

figure

x = totalPercentages;
y = totalTrialStd;

% Plot 3
plot(x, y, 'b-', 'LineWidth', 2); 
xlabel('Percentages of Training Data Used');
ylabel('Standard deviation (5 trials) ');
title('Std vs Percentages'); 
grid on; 
%10^-15
ylim([0 0.000000000000001]);
%% Functions

%Function for loading training data 
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

function [predicted, real] = singleTest(digitImagesArray, validationLabels, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, image)
       %forward feed
       a0flip = ones(inputLayerNodes + 1, 1);
       a0flip(2:end) = reshape(digitImagesArray(:,:,image), [28*28,1]);
       a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
       zs1 = weight1 .* a0flipRep;
       z1 = sum(zs1);
       a1 = (1 + exp(-z1)).^-1;
       a1flip = ones(hiddenLayerNodes + 1, 1);
       a1flip(2:end) = a1';
       a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
       zs2 = weight2 .* a1flipRep;
       z2 = sum(zs2);
       a2 = (1 + exp(-z2)).^-1;
       [~, predictedDigit] = max(a2);
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