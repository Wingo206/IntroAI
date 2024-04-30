%% Load data 
digitTrainingFile = fopen("digitdata/trainingimages", "r");
digitTrainingLabelsFile = fopen("digitdata/traininglabels", "r");
labels = fscanf(digitTrainingLabelsFile, "%d");
line = fgetl(digitTrainingFile);
digitImagesArray = zeros(28,28,5000);
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
epochs = 100;
weight1 = 2*rand(inputLayerNodes + 1, hiddenLayerNodes)-1;
weight2 = 2*rand(hiddenLayerNodes + 1, outputLayerNodes)-1;
totalCost = 9999;
epochCounter = 0;

%%for i = 1:epochs
prevAccs = zeros(1, 10);
while learningRate > 0.001 
   totalCost = 0;
   grad1 = zeros(inputLayerNodes + 1, hiddenLayerNodes);
   grad2 = zeros(hiddenLayerNodes + 1, outputLayerNodes);
   numCorrect = 0;
   for j = 1:5000
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

writematrix(weight1, "NNweight1_100.csv");
writematrix(weight2, "NNweight2_100.csv");
%% Test Neural Network
weight1 = csvread("NNweight1_100.csv");
weight2 = csvread("NNweight2_100.csv");
digitValidationFile = fopen("digitdata/validationimages", "r");
digitValidationLabelFile = fopen("digitdata/validationlabels", "r");
validationLabels = fscanf(digitValidationLabelFile, "%d");
line = fgetl(digitValidationFile)
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
    line = fgetl(digitValidationFile);
end

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
accuracy = mean(results)